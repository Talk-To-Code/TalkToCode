package ast;
import java.util.ArrayList;
/**
 * @author GAO RISHENG A0101891L
 * This class is mainly constructing AST nodes for Class declaration in the program.
 * Since C does not support class, only Java and Python will have subclasses under this class
 *
 */
public class ASTClass extends ASTBlockStatement {
	private static final String NODE_TYPE = "Class Declaration";
	//the class name
	protected ASTExpressionUnitIdentifier name;
	//A class can have multiple statements like functions and attributes 
	protected ArrayList<ASTStatement> statements;
	public ASTClass(String name) {
		super();
		ASTExpressionUnitIdentifier className = new ASTExpressionUnitIdentifier(name);
		this.name = className;
		className.addParent(this);
	}
	//adding a statement to this class
	public void addStatement(ASTStatement s){
		this.statements.add(s);
		s.addParent(this);
	}
	//virtual method
	public String toSyntax(){
		return this.result;
	}
	public String typeof(){
		return super.typeof()+"->"+NODE_TYPE;
	}
	public String toTree(int indent){
		StringBuilder sb = new StringBuilder("");
		for(int i = 0;i<indent;i++){
			sb.append("\t");
		}
		sb.append(this.typeof());
		sb.append("\n");
		for(ASTStatement s:this.statements){
			sb.append(s.toTree(indent+1));
			sb.append("\n");
		}
		return sb.toString();
	}
}
