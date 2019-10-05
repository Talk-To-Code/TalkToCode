package ast;
/**
 * @author GAO RISHENG A0101891L
 * This class is mainly in charge of construction of AST nodes that represents
 * a term of a variable (like x) 
 * and syntax generation of the respective term.
 * This is available in all C/JAVA/PYTHON.
 */
public class ASTExpressionUnitIdentifier extends ASTExpressionUnit{
	private static final String NODE_TYPE = "Identifier";
	private String name;
	public ASTExpressionUnitIdentifier() {
		super();
	}

	public ASTExpressionUnitIdentifier(String name){
		this();
		this.name = name;
	}
	public String toSyntax(){
		return this.name;
	}
	public String typeof() {
		return super.typeof()+"->"+NODE_TYPE;
	}

	public boolean equals(String s){
		return this.name.equals(s);
	}
}
