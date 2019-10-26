package ast;
import java.util.ArrayList;
/**
 * @author GAO RISHENG
 * This class is to generate Class Declaration AST Nodes into Java Syntax
 *
 */
public class ASTClassJ extends ASTClass {
	private static final String DEFAULT_MODIFIER = "";
	//modifiers include : public/protected/private/final
	private ArrayList<String> modifiers;
	//modifiers include : implement/extends
	private String inheritModifier = DEFAULT_MODIFIER;
	private ASTExpressionUnitIdentifier inheritClass;
	public ASTClassJ(String name) {
		super(name);
		this.modifiers = new ArrayList<String>();
	}
	public void addModifier(String modifier){
		this.modifiers.add(modifier);
	}
	
	public void addInheritance(String modifier,ASTExpressionUnitIdentifier inheritClass){
		this.inheritModifier = modifier;
		this.inheritClass = inheritClass;
		inheritClass.addParent(this);
	}
	//Code Syntax construction
	//Output format will be
	//modifier class Name modifier Name {
	// statements
	//}
	public String toSyntax(){
		this.result = "";
		for(String s:this.modifiers){
			this.result += s;
			this.result += " ";
		}
		this.result += "class ";
		this.result += this.name;
		if(!this.inheritModifier.equals(DEFAULT_MODIFIER)){
			this.result += " ";
			this.result += this.inheritModifier;
			this.result += " ";
			this.result += this.inheritClass.toSyntax();
		}
		this.result+= "{\n";
		for(ASTStatement s:this.statements){
			this.result += "\t";
			this.result+= s.toSyntax();
			this.result+= "\n";
		}
		this.result+="}\n";
		return this.result;
	}
}
